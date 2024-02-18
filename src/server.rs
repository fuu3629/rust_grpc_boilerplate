use crate::infrastructure::infrastructure::InfrastructureImpl;
use crate::{infrastructure, job_manage};
use job_manage::job_manage_service_server::JobManageServiceServer;
use job_manage::{
    job_manage_service_server::JobManageService, CreateGroupRequest, CreateShiftRequest,
    CreateUserRequest, CreateUserResponse, LoginUserRequest, LoginUserResponse,
};
use std::net::SocketAddr;
use tonic::{transport::Server, Request, Response, Status};
use tonic_reflection::server::Builder;

#[derive(Default)]
pub struct MyJobManage {
    infrastructure: InfrastructureImpl,
}

impl MyJobManage {
    pub fn new() -> MyJobManage {
        MyJobManage {
            infrastructure: InfrastructureImpl::new(),
        }
    }
    pub async fn run_server(self, addr: SocketAddr) -> Result<(), Box<dyn std::error::Error>> {
        // let allow_cors = CorsLayer::new()
        //     .allow_origin(tower_http::cors::Any)
        //     .allow_headers(tower_http::cors::Any)
        //     .allow_methods(tower_http::cors::Any);
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
        let token = self
            .infrastructure
            .create_user(request.into_inner())
            .await?;
        Ok(Response::new(token))
    }

    async fn login_user(
        &self,
        request: Request<LoginUserRequest>,
    ) -> Result<Response<LoginUserResponse>, Status> {
        let response = self.infrastructure.login_user(request.into_inner()).await?;
        Ok(Response::new(response))
    }

    async fn create_shift(
        &self,
        request: Request<CreateShiftRequest>,
    ) -> Result<Response<()>, Status> {
        let token = request
            .metadata()
            .get("authorization")
            .ok_or(Status::unauthenticated("No access token specified"))?
            .to_str()
            .map_err(|_| Status::unauthenticated("Invalid access token"))?;
        match infrastructure::infrastructure::verify_token(token) {
            Ok(true) => (),
            Err(_) | Ok(false) => return Err(Status::unauthenticated("Invalid token")),
        }
        let _res = self.infrastructure.create_shift(request.into_inner()).await;
        Ok(Response::new(()))
    }

    async fn create_group(
        &self,
        request: Request<CreateGroupRequest>,
    ) -> Result<Response<()>, Status> {
        let _ = self.infrastructure.create_group(request.into_inner()).await;
        Ok(Response::new(()))
    }
}
