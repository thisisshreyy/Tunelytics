from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SPOTIFY_CLIENT_ID: str = ""
    SPOTIFY_CLIENT_SECRET: str = ""
    SPOTIFY_REDIRECT_URI: str = "http://127.0.0.1:3000/callback"
    DATABASE_URL: str = "sqlite:///./tunelytics.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    FRONTEND_URL: str = "http://127.0.0.1:3000"
    DEMO_MODE: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()
