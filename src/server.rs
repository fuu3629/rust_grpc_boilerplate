use crate::infrastructure::infrastructure::InfrastructureImpl;
use crate::job_manage;
use job_manage::job_manage_service_server::JobManageServiceServer;
use job_manage::{
    job_manage_service_server::JobManageService, CreateShiftRequest, CreateShiftResponse,
    CreateUserRequest, CreateUserResponse, LoginUserRequest, LoginUserResponse,
};
use sea_orm::*;
use std::net::SocketAddr;
use tonic::{transport::Server, Request, Response, Status};
use tonic_reflection::server::Builder;

#[derive(Default)]
pub struct MyJobManage {
    db: DatabaseConnection,
    infrastructure: InfrastructureImpl,
}

impl MyJobManage {
    pub fn new(db: &DatabaseConnection) -> MyJobManage {
        MyJobManage {
            db: db.clone(),
            infrastructure: InfrastructureImpl::default(),
        }
    }
    pub async fn run_server(self, addr: SocketAddr) -> Result<(), Box<dyn std::error::Error>> {
        Server::builder()
            .add_service(JobManageServiceServer::new(self))
            .add_service(
                Builder::configure()
                    .register_encoded_file_descriptor_set(tonic::include_file_descriptor_set!(
                        "store_descriptor"
                    ))
                    .build()
                    .unwrap(),
            )
            .serve(addr)
            .await?;

        Ok(())
    }
}

#[tonic::async_trait]
impl JobManageService for MyJobManage {
    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<CreateUserResponse>, Status> {
        let _res = self.infrastructure.create_user(request.into_inner()).await;
        let response = CreateUserResponse {
            message: "123".to_string(),
        };
        Ok(Response::new(response))
    }

    async fn login_user(
        &self,
        request: Request<LoginUserRequest>,
    ) -> Result<Response<LoginUserResponse>, Status> {
        println!("Got a request: {:?}", request);
        let response = LoginUserResponse {
            message: "123".to_string(),
        };
        Ok(Response::new(response))
    }

    async fn create_shift(
        &self,
        request: Request<CreateShiftRequest>,
    ) -> Result<Response<CreateShiftResponse>, Status> {
        println!("Got a request: {:?}", request);
        let response = CreateShiftResponse {
            message: "123".to_string(),
        };
        Ok(Response::new(response))
    }
}
