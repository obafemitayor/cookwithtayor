class UserService
  def initialize(user_model: User)
    @user_model = user_model
  end

  def find_by_email(email)
    user_model.find_by!(email: email)
  end

  def user_exists?(email)
    find_by_email(email)
    true
  rescue ActiveRecord::RecordNotFound
    false
  end

  def find(id)
    user_model.find(id)
  end

  def create_user(attributes)
    user_model.create!(attributes)
  end

  private

  attr_reader :user_model
end
