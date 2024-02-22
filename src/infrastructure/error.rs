use bcrypt;
use jwt;
use sea_orm::error::DbErr;
use thiserror::Error;

#[derive(Error, Debug)]
#[non_exhaustive]
pub enum InfrastructureError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] DbErr),
    #[error("Bcrypt error: {0}")]
    BcryptError(#[from] bcrypt::BcryptError),
    #[error("Jwt error: {0}")]
    JwtError(#[from] jwt::error::Error),
    #[error("{0}")]
    Unknown(#[source] Box<dyn std::error::Error + Sync + Send>),
}

impl From<InfrastructureError> for tonic::Status {
    fn from(err: InfrastructureError) -> tonic::Status {
        match err {
            InfrastructureError::DatabaseError(err) => {
                tonic::Status::unavailable(format!("Database error: {:?}", err))
            }
            InfrastructureError::BcryptError(err) => {
                tonic::Status::unavailable(format!("Bcrypt error: {:?}", err))
            }
            InfrastructureError::JwtError(err) => {
                tonic::Status::unavailable(format!("Jwt error: {:?}", err))
            }
            InfrastructureError::Unknown(err) => tonic::Status::unavailable(format!("{:?}", err)),
        }
    }
}
