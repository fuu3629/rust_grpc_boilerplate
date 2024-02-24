use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Shift::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Shift::ShiftId)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Shift::UserId).integer().not_null())
                    .col(ColumnDef::new(Shift::Assigned).boolean().not_null())
                    .col(ColumnDef::new(Shift::Start).string().not_null())
                    .col(ColumnDef::new(Shift::End).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Shift::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Shift {
    Table,
    ShiftId,
    UserId,
    Assigned,
    Start,
    End,
}
