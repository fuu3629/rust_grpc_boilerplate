use super::entities::prelude::{Shift, User};
use super::entities::*;
use super::entities::{shift::ActiveModel as ShiftModel, user::ActiveModel as UserModel};
use crate::job_manage;
use job_manage::{
    job_manage_service_server::JobManageService, CreateShiftRequest, CreateShiftResponse,
    CreateUserRequest, CreateUserResponse, LoginUserRequest, LoginUserResponse,
};
use sea_orm::*;
#[derive(Default)]
pub struct InfrastructureImpl {
    db: DatabaseConnection,
}

impl InfrastructureImpl {
    pub async fn create_user(&self, request: CreateUserRequest) -> Result<(), DbErr> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let user = user::ActiveModel {
            user_name: ActiveValue::set(request.user_name),
            email: ActiveValue::set(request.email),
            password: ActiveValue::set(request.password),
            permission: ActiveValue::set(request.permission),
            ..Default::default()
        };
        let _res = User::insert(user).exec(&db).await?;
        print!("{:?}", _res);
        Ok(())
    }

    pub async fn create_shift(&self, request: CreateShiftRequest) -> Result<(), DbErr> {
        let user_id = request.user_id;
        for shift in request.shifts {
            let shift = ShiftModel {
                user_id: ActiveValue::set(user_id),
                assigned: ActiveValue::set(false),
                year: ActiveValue::set(shift.year),
                month: ActiveValue::set(shift.month),
                day: ActiveValue::set(shift.day),
                ..Default::default()
            };
            let r = Shift::insert(shift).exec(&self.db).await?;
        }
        Ok(())
    }
}
