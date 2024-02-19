use super::entities::prelude::{Group as GroupEntity, Shift, User};
use super::entities::*;
use crate::job_manage::{
    CreateGroupRequest, CreateShiftRequest, CreateUserRequest, CreateUserResponse,
    GetAllGroupResponse, Group, LoginUserRequest, LoginUserResponse,
};
use bcrypt::verify;
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use sea_orm::*;
use sha2::Sha256;
use std::ops::Add;
use std::time::Duration;
use std::{
    collections::{BTreeMap, HashMap},
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
    ) -> Result<CreateUserResponse, Status> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url)
            .await
            .map_err(|_| Status::already_exists("user already exist"))?;
        let password = bcrypt::hash(request.password, 10)
            .map_err(|_| Status::unknown("Error while creating the user"))?;
        let user = user::ActiveModel {
            user_name: ActiveValue::set(request.user_name),
            email: ActiveValue::set(request.email),
            group_id: ActiveValue::set(request.group_id),
            password: ActiveValue::set(password),
            permission: ActiveValue::set(request.permission),
            ..Default::default()
        };
        let _res = User::insert(user)
            .exec(&db)
            .await
            .map_err(|_| Status::already_exists("user already exists"))?;
        let user_id = _res.last_insert_id;
        let token = generate_token(user_id)?;
        Ok(CreateUserResponse { token: token })
    }

    pub async fn login_user(&self, request: LoginUserRequest) -> Result<LoginUserResponse, Status> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url)
            .await
            .map_err(|_| Status::permission_denied("DataBase connection error"))?;
        let user = User::find()
            .filter(user::Column::Email.eq(request.email))
            .one(&db)
            .await
            .map_err(|_| Status::not_found("such group is not exist"))?
            .unwrap();
        match verify(request.password, &user.password) {
            Ok(true) => {
                let token = generate_token(user.user_id)?;
                Ok(LoginUserResponse { token: token })
            }
            Ok(false) | Err(_) => return Err(Status::permission_denied("password is not correct")),
        }
    }

    pub async fn create_group(&self, request: CreateGroupRequest) -> Result<(), Status> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url)
            .await
            .map_err(|_| Status::permission_denied("DataBase connection error"))?;
        let group = group::ActiveModel {
            group_name: ActiveValue::set(request.group_name),
            email: ActiveValue::set(request.email),
            ..Default::default()
        };
        let _res = GroupEntity::insert(group)
            .exec(&db)
            .await
            .map_err(|_| Status::already_exists("group already exists"))?;
        Ok(())
    }

    pub async fn create_shift(&self, request: CreateShiftRequest) -> Result<(), Status> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url)
            .await
            .map_err(|_| Status::already_exists("DataBase connection error"))?;
        //TODO check if user exists
        let user_id = request.user_id;
        let dates = request.shifts.clone();
        let shifts = dates
            .iter()
            .map(|shift| shift::ActiveModel {
                user_id: ActiveValue::set(user_id),
                assigned: ActiveValue::set(false),
                year: ActiveValue::set(shift.year),
                month: ActiveValue::set(shift.month),
                day: ActiveValue::set(shift.day),
                ..Default::default()
            })
            .collect::<Vec<shift::ActiveModel>>();
        let _res = Shift::insert_many(shifts)
            .exec(&db)
            .await
            .map_err(|_| Status::already_exists("user already exists"))?;
        Ok(())
    }

    pub async fn get_all_group(&self) -> Result<GetAllGroupResponse, Status> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url)
            .await
            .map_err(|_| Status::already_exists("DataBase connection error"))?;
        let groups = GroupEntity::find()
            .all(&db)
            .await
            .map_err(|_| Status::not_found("groups not found"))?;
        let response = groups
            .iter()
            .map(|group| Group {
                group_id: group.group_id.clone(),
                group_name: group.group_name.clone(),
            })
            .collect();
        Ok(GetAllGroupResponse { groups: response })
    }
}

fn generate_claims(user_id: i32) -> Result<BTreeMap<&'static str, String>, Status> {
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

fn generate_token(user_id: i32) -> Result<String, Status> {
    let app_key: String = env::var("APP_KEY").expect("env APP_KEY is not defined");
    let key: Hmac<Sha256> =
        Hmac::new_from_slice(app_key.as_bytes()).expect("failed to create key from app key");
    let claims = generate_claims(user_id).expect("failed to create claims");
    let access_token = claims.sign_with_key(&key).expect("fial to create token");
    Ok(access_token)
}

pub fn verify_token(token: &str) -> Result<bool, Status> {
    let app_key: String = env::var("APP_KEY").expect("env APP_KEY is not defined");

    let key: Hmac<Sha256> = Hmac::new_from_slice(app_key.as_bytes())
        .map_err(|_| Status::failed_precondition("failed to create key"))?;

    Ok(token
        .verify_with_key(&key)
        .map(|_: HashMap<String, String>| true)
        .unwrap_or(false))
}
