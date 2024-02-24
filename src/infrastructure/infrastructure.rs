use super::entities::prelude::{Group as GroupEntity, Shift as ShiftEntity, User};
use super::entities::*;
use super::error::InfrastructureError;
use crate::job_manage::{
    CreateGroupRequest, CreateShiftRequest, CreateUserRequest, CreateUserResponse,
    GetAllGroupResponse, GetShiftsResponse, Group, LoginUserRequest, LoginUserResponse, Shift,
};
use bcrypt::verify;
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use sea_orm::*;
use sha2::Sha256;
use std::ops::Add;
use std::time::Duration;
use std::{
    collections::BTreeMap,
    env,
    time::{SystemTime, UNIX_EPOCH},
};
use tonic::Status;
#[derive(Default)]
pub struct InfrastructureImpl {}

impl InfrastructureImpl {
    pub fn new() -> InfrastructureImpl {
        InfrastructureImpl {}
    }
    pub async fn create_user(
        &self,
        request: CreateUserRequest,
    ) -> Result<CreateUserResponse, InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let password = bcrypt::hash(request.password, 10)?;
        let user = user::ActiveModel {
            user_name: ActiveValue::set(request.user_name),
            email: ActiveValue::set(request.email),
            group_id: ActiveValue::set(request.group_id),
            password: ActiveValue::set(password),
            permission: ActiveValue::set(request.permission),
            ..Default::default()
        };
        let _res = User::insert(user).exec(&db).await?;
        let user_id = _res.last_insert_id;
        let token = generate_token(user_id)?;
        Ok(CreateUserResponse { token: token })
    }

    pub async fn login_user(
        &self,
        request: LoginUserRequest,
    ) -> Result<LoginUserResponse, InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let user = User::find()
            .filter(user::Column::Email.eq(request.email))
            .one(&db)
            .await?
            .unwrap();
        match verify(request.password, &user.password) {
            Ok(true) => {
                let token = generate_token(user.user_id)?;
                Ok(LoginUserResponse { token: token })
            }
            Ok(false) | Err(_) => {
                return Err(InfrastructureError::JwtError(
                    jwt::error::Error::InvalidSignature,
                ));
            }
        }
    }

    pub async fn create_group(
        &self,
        request: CreateGroupRequest,
    ) -> Result<(), InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        //TODO グループ名をユニークにする
        let group = group::ActiveModel {
            group_name: ActiveValue::set(request.group_name),
            email: ActiveValue::set(request.email),
            ..Default::default()
        };
        let _res = GroupEntity::insert(group).exec(&db).await?;
        Ok(())
    }

    pub async fn create_shift(
        &self,
        request: CreateShiftRequest,
        user_id: i32,
    ) -> Result<(), InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let dates = request.shifts.clone();
        let shifts = dates
            .iter()
            .map(|shift| shift::ActiveModel {
                user_id: ActiveValue::set(user_id),
                assigned: ActiveValue::set(false),
                start: ActiveValue::set(shift.start.clone()),
                end: ActiveValue::set(shift.end.clone()),
                ..Default::default()
            })
            .collect::<Vec<shift::ActiveModel>>();
        let _res = ShiftEntity::insert_many(shifts).exec(&db).await?;
        Ok(())
    }

    pub async fn get_all_group(&self) -> Result<GetAllGroupResponse, InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let groups = GroupEntity::find().all(&db).await?;
        let response = groups
            .iter()
            .map(|group| Group {
                group_id: group.group_id.clone(),
                group_name: group.group_name.clone(),
            })
            .collect();
        Ok(GetAllGroupResponse { groups: response })
    }

    pub async fn get_shifts(&self, user_id: i32) -> Result<GetShiftsResponse, InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;

        let shifts = ShiftEntity::find()
            .filter(shift::Column::UserId.eq(user_id))
            .all(&db)
            .await?;

        let shifts = shifts
            .clone()
            .iter()
            .map(|shift| Shift {
                status: if shift.assigned { 1 } else { 0 },
                start: shift.start.clone(),
                end: shift.end.clone(),
            })
            .collect::<Vec<Shift>>();

        let total_time = 0;
        let res = GetShiftsResponse {
            shifts: shifts,
            total_time: total_time,
        };
        Ok(res)
    }
}

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
