from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    smtp_host: str = "sandbox.smtp.mailtrap.io"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "billing@devsaura.com"
    smtp_from_name: str = "DevsAura Billing"
    output_dir: str = "output"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
