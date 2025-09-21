package routes

import (
	"bookstore/internal/handlers"
	"bookstore/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	categoryHandler *handlers.CategoryHandler,
	bookHandler *handlers.BookHandler,
	orderHandler *handlers.OrderHandler,
) {
	api := router.Group("/api")

	{
		// Health check route
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "OK",
				"message": "API is healthy",
			})
		})

		// Public Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes (require JWT)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Auth protected routes
			authProtected := protected.Group("/auth")
			{
				authProtected.GET("/me", authHandler.GetCurrentUser)
			}

			// Category routes
			categories := protected.Group("/categories")
			{
				categories.POST("/", middleware.RequireRole("admin"), categoryHandler.CreateCategory)
				categories.GET("/", middleware.RequireRole("admin", "customer"), categoryHandler.GetAllCategories)
				categories.GET("/:id", middleware.RequireRole("admin", "customer"), categoryHandler.GetCategoryByID)
				categories.PUT("/:id", middleware.RequireRole("admin"), categoryHandler.UpdateCategory)
				categories.DELETE("/:id", middleware.RequireRole("admin"), categoryHandler.DeleteCategory)
			}

			// Book routes
			books := protected.Group("/books")
			{
				books.POST("/", middleware.RequireRole("admin"), bookHandler.CreateBook)
				books.GET("/", middleware.RequireRole("admin", "customer"), bookHandler.GetAllBooks)
				books.GET("/:id", middleware.RequireRole("admin", "customer"), bookHandler.GetBookByID)
				books.PUT("/:id", middleware.RequireRole("admin"), bookHandler.UpdateBook)
				books.DELETE("/:id", middleware.RequireRole("admin"), bookHandler.DeleteBook)
			}

			// Order routes
			orders := protected.Group("/orders")
			{
				orders.POST("/", middleware.RequireRole("customer"), orderHandler.CreateOrder)
				orders.GET("/", middleware.RequireRole("admin", "customer"), orderHandler.GetAllOrders)
				orders.GET("/:id", middleware.RequireRole("admin", "customer"), orderHandler.GetOrderByID)
				orders.PUT("/:id/status", middleware.RequireRole("admin"), orderHandler.UpdateOrderStatus)
				orders.DELETE("/:id", middleware.RequireRole("admin"), orderHandler.DeleteOrder)
			}
		}
	}
}
