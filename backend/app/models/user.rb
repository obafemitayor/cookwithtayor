class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true
  has_many :user_ingredients, dependent: :destroy
  has_many :ingredients, through: :user_ingredients
end
