from flask import Flask
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Blueprints
    from .api.auth import bp as auth_bp
    from .api.customers import bp as customers_bp
    from .api.products import bp as products_bp
    from .api.stores import bp as stores_bp
    from .api.cart import bp as cart_bp
    from .api.orders import bp as orders_bp
    from .api.admin import bp as manager_bp
    from .api.stats import bp as stats_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(customers_bp, url_prefix="/api/customers")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(stores_bp, url_prefix="/api/stores")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(manager_bp, url_prefix="/api/manager")
    app.register_blueprint(stats_bp, url_prefix="/api/stats")

    # health check
    '''
    @app.get("/")
    def home():
        """
        Health check / welcome route for the JellyDog API.
        Visit this to verify that the backend is running.
        """
        return {
            "status": "ok",
            "message": "Welcome to JellyDog API 🎉. Try /api/products or /api/orders"
        }
    '''
    return app


