mod infrastructure;
mod server;
use sea_orm::*;
pub mod job_manage {
    tonic::include_proto!("job_manage");
}

async fn connect(db_url: &str) -> Result<DatabaseConnection, DbErr> {
    let db: DatabaseConnection = Database::connect(db_url).await?;
    Ok(db)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = "postgres://postgres:password@0.0.0.0:5432/example";
    let db: DatabaseConnection = connect(database_url).await?;
    let addr = "127.0.0.1:50051".parse()?;
    let service = server::MyJobManage::new(&db);
    service.run_server(addr).await?;
    Ok(())
}
