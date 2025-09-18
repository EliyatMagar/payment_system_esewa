package services

import (
	"bookstore/internal/models"
	"bookstore/internal/repositories"
	"bookstore/pkg/utils"
	"errors"
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService(userRepo *repositories.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

// Register new user
func (s *AuthService) Register(name, email, password string) (*models.User, error) {
	// check if email exists
	existing, _ := s.userRepo.FindByEmail(email)
	if existing != nil {
		return nil, errors.New("email already in use")
	}

	// hash password
	hashed, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: hashed,
		Role:     "customer",
	}
	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// Login user
func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if !utils.CheckPassword(password, user.Password) {
		return "", errors.New("invalid credentials")
	}

	// generate JWT token
	token, err := utils.GenerateJWT(user.ID.String(), user.Role)
	if err != nil {
		return "", err
	}

	return token, nil
}
