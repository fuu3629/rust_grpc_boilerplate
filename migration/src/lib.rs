pub use sea_orm_migration::prelude::*;

mod m20240209_135152_user;
mod m20240209_135644_shift;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240209_135152_user::Migration),
            Box::new(m20240209_135644_shift::Migration),
        ]
    }
}
