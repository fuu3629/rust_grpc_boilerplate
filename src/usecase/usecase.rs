use crate::infrastructure::error::InfrastructureError;
use crate::infrastructure::infrastructure::InfrastructureImpl;
use crate::job_manage;
use bcrypt::verify;
use hmac::{Hmac, Mac};
use job_manage::{
    CreateGroupRequest, CreateShiftRequest, CreateUserRequest, CreateUserResponse,
    GetAllGroupResponse, GetShiftsResponse, LoginUserRequest, LoginUserResponse,
};
use jwt::{SignWithKey, VerifyWithKey};
use sha2::Sha256;
use std::ops::Add;
use std::time::Duration;
use std::{
    collections::BTreeMap,
    time::{SystemTime, UNIX_EPOCH},
};
use tonic::Request;
use tonic::Status;

#[derive(Default)]
pub struct UsecaseImpl {
    infrastructure: InfrastructureImpl,
}

impl UsecaseImpl {
    pub fn new() -> UsecaseImpl {
        UsecaseImpl {
            infrastructure: InfrastructureImpl::new(),
        }
    }

    pub async fn create_user(
        &self,
        request: CreateUserRequest,
    ) -> Result<CreateUserResponse, Status> {
        let user_id = self.infrastructure.create_user(request).await?;
        let token = generate_token(user_id)?;
        let res = CreateUserResponse { token: token };
        Ok(res)
    }

    pub async fn login_user(&self, request: LoginUserRequest) -> Result<LoginUserResponse, Status> {
        let user = self.infrastructure.login_user(request.clone()).await?;
        match verify(request.password, &user.password) {
            Ok(true) => {
                let token = generate_token(user.user_id)?;
                Ok(LoginUserResponse { token: token })
            }
            Ok(false) | Err(_) => {
                return Err(Status::failed_precondition("Invalid password"));
            }
        }
    }

    pub async fn create_group(&self, request: CreateGroupRequest) -> Result<(), Status> {
        let res = self.infrastructure.create_group(request).await?;
        Ok(res)
    }

    pub async fn create_shift(&self, request: Request<CreateShiftRequest>) -> Result<(), Status> {
        let token = request
            .metadata()
            .get("authorization")
            .ok_or(Status::unauthenticated("No access token specified"))?
            .to_str()
            .map_err(|_| Status::unauthenticated("Invalid access token"))?;
        let claim = match verify_token(token) {
            Ok(claim) => claim,
            Err(_) => return Err(Status::unauthenticated("Invalid token")),
        };
        let user_id = claim["sub"].as_str().parse::<i32>().unwrap();
        let res = self
            .infrastructure
            .create_shift(request.into_inner(), user_id)
            .await?;
        Ok(res)
    }

    pub async fn get_all_group(&self) -> Result<GetAllGroupResponse, Status> {
        let groups = self.infrastructure.get_all_group().await?;
        let res = GetAllGroupResponse { groups };
        Ok(res)
    }

    pub async fn get_shifts(&self, request: Request<()>) -> Result<GetShiftsResponse, Status> {
        let token = request
            .metadata()
            .get("authorization")
            .ok_or(Status::unauthenticated("No access token specified"))?
            .to_str()
            .map_err(|_| Status::unauthenticated("Invalid access token"))?;
        let claim = match verify_token(token) {
            Ok(claim) => claim,
            Err(_) => return Err(Status::unauthenticated("Invalid token")),
        };
        let user_id = claim["sub"].as_str().parse::<i32>().unwrap();
        let shifts = self.infrastructure.get_shifts(user_id).await?;
        Ok(shifts)
    }
}

// Auth関連の処理
fn generate_claims(user_id: i32) -> Result<BTreeMap<&'static str, String>, InfrastructureError> {
    let mut claims: BTreeMap<&str, String> = BTreeMap::new();

    claims.insert("sub", user_id.to_string());

    let current_timestamp = SystemTime::now().duration_since(UNIX_EPOCH);
    let exp = SystemTime::now()
        .add(Duration::from_secs(3600))
        .duration_since(UNIX_EPOCH);

    claims.insert("iat", current_timestamp.unwrap().as_secs().to_string());
    claims.insert("exp", exp.unwrap().as_secs().to_string());

    Ok(claims)
}

fn generate_token(user_id: i32) -> Result<String, InfrastructureError> {
    //TODO: 環境変数から取得する
    let app_key: String = "9E3CnfSfsi9BGfX3Dea#tkbs#nDj&6d#6Y&jhNa!".to_string();
    let key: Hmac<Sha256> =
        Hmac::new_from_slice(app_key.as_bytes()).expect("failed to create key from app key");
    let claims = generate_claims(user_id)?;
    let acces_token = claims.sign_with_key(&key)?;
    Ok(acces_token)
}

pub fn verify_token(token: &str) -> Result<BTreeMap<String, String>, Status> {
    //TODO: 環境変数から取得する
    let app_key: String = "9E3CnfSfsi9BGfX3Dea#tkbs#nDj&6d#6Y&jhNa!".to_string();

    let key: Hmac<Sha256> = Hmac::new_from_slice(app_key.as_bytes())
        .map_err(|_| Status::failed_precondition("failed to create key"))?;
    token
        .verify_with_key(&key)
        .map_err(|_| Status::failed_precondition("failed to verify"))
}
