package middleware

import (
	"bookstore/pkg/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT and extracts user info
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required")
			c.Abort()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid Authorization header")
			c.Abort()
			return
		}

		claims, err := utils.ValidateJWT(tokenParts[1])
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}

		// ✅ store user info in context
		if userID, ok := claims["user_id"].(string); ok {
			c.Set("user_id", userID)
		}
		if role, ok := claims["role"].(string); ok {
			c.Set("role", role)
		}

		c.Next()
	}
}

// RequireRole restricts access to specific roles
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Role not found in token")
			c.Abort()
			return
		}

		userRole, ok := roleVal.(string)
		if !ok {
			utils.ErrorResponse(c, http.StatusForbidden, "Invalid role type")
			c.Abort()
			return
		}

		// Check if user role matches allowed roles
		for _, r := range roles {
			if userRole == r {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "You do not have access to this resource")
		c.Abort()
	}
}
