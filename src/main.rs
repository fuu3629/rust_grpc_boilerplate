mod infrastructure;
mod server;
pub mod job_manage {
    tonic::include_proto!("job_manage");
}
use dotenvy::dotenv;

// sea-orm-cli migrate refresh
// sea-orm-cli generate entity -o src/infrastructure/entities

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let addr = "127.0.0.1:50051".parse()?;
    let service = server::MyJobManage::new();
    service.run_server(addr).await?;
    Ok(())
}
