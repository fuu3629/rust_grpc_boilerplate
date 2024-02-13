//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "shift")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub shift_id: i32,
    pub user_id: i32,
    pub assigned: bool,
    pub year: i32,
    pub month: i32,
    pub day: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
