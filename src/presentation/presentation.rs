mod job_manage {
    tonic::include_proto!("job_manage");
}
use job_manage::{
    job_manage_service_server::JobManageService, CreateUserRequest, CreateUserResponse,
};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tonic::{Request, Response, Status};

#[derive(Debug, Default)]
pub struct MyJobManageService {}

#[tonic::async_trait]
impl JobManageService for MyJobManageService {
    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<CreateUserResponse>, Status> {
        println!("Got a request: {:?}", request);
        let response = CreateUserResponse {
            message: "123".to_string(),
        };
        Ok(Response::new(response))
    }
}
// use super::MyJobManageService;
// use job_manage::{
//     job_manage_service_server::{JobManageService, JobManageServiceServer},
//     CreateUserRequest, CreateUserResponse,
// };

// pub mod presentaion {
//     use super::MyJobManageService;
//     use job_manage::{
//         job_manage_service_server::{JobManageService, JobManageServiceServer},
//         CreateUserRequest, CreateUserResponse,
//     };
//     #[tonic::async_trait]
//     impl JobManageService for MyJobManageService {
//         pub async fn create_user(
//             &self,
//             request: Request<CreateUserRequest>,
//         ) -> Result<Response<CreateUserResponse>, Status> {
//             println!("Got a request: {:?}", request);
//             let response = CreateUserResponse {
//                 message: "123".to_string(),
//             };
//             Ok(Response::new(response))
//         }
//     }
// }
