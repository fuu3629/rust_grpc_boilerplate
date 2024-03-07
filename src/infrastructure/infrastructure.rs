use self::user::Model as UserModel;
use super::entities::prelude::{Group as GroupEntity, Shift as ShiftEntity, User};
use super::entities::*;
use super::error::InfrastructureError;
use crate::job_manage::{
    CreateGroupRequest, CreateShiftRequest, CreateUserRequest, GetShiftsResponse, Group,
    LoginUserRequest, Shift,
};
use chrono::NaiveDateTime;
use prost_types::Timestamp;
use sea_orm::*;
#[derive(Default)]
pub struct InfrastructureImpl {}

impl InfrastructureImpl {
    pub fn new() -> InfrastructureImpl {
        InfrastructureImpl {}
    }

    pub async fn create_user(
        &self,
        request: CreateUserRequest,
    ) -> Result<i32, InfrastructureError> {
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
        Ok(user_id)
    }

    pub async fn login_user(
        &self,
        request: LoginUserRequest,
    ) -> Result<UserModel, InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let user = User::find()
            .filter(user::Column::Email.eq(request.email))
            .one(&db)
            .await?
            .unwrap();
        Ok(user)
    }

    pub async fn create_group(
        &self,
        request: CreateGroupRequest,
    ) -> Result<(), InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
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
                start: ActiveValue::set(
                    NaiveDateTime::from_timestamp_opt(
                        shift.start.clone().unwrap().seconds,
                        shift.start.clone().unwrap().nanos as u32,
                    )
                    .unwrap(),
                ),
                end: ActiveValue::set(
                    NaiveDateTime::from_timestamp_opt(
                        shift.end.clone().unwrap().seconds,
                        shift.end.clone().unwrap().nanos as u32,
                    )
                    .unwrap(),
                ),
                ..Default::default()
            })
            .collect::<Vec<shift::ActiveModel>>();
        let _res = ShiftEntity::insert_many(shifts).exec(&db).await?;
        Ok(())
    }

    pub async fn get_all_group(&self) -> Result<Vec<Group>, InfrastructureError> {
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
        Ok(response)
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
                shift_id: shift.shift_id,
                start: Some(Timestamp {
                    seconds: shift.start.timestamp(),
                    nanos: 0,
                }),
                end: Some(Timestamp {
                    seconds: shift.end.timestamp(),
                    nanos: 0,
                }),
            })
            .collect::<Vec<Shift>>();

        let total_time = shifts.iter().fold(0, |acc, shift| {
            acc + (shift.end.clone().unwrap().seconds - shift.start.clone().unwrap().seconds)
        });

        let res = GetShiftsResponse {
            shifts: shifts,
            total_time: total_time as i32,
        };
        Ok(res)
    }

    pub async fn delete_shift(&self, shift_id: i32) -> Result<(), InfrastructureError> {
        let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
        let db: DatabaseConnection = Database::connect(database_url).await?;
        let _res = ShiftEntity::delete_by_id(shift_id).exec(&db).await?;
        Ok(())
    }
}
