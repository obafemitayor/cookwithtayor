class CuisinesController < ApplicationController
  def index
    cuisines = cuisine_service.list_all
    render json: { cuisines: cuisines }, status: :ok
  end

  private
  def cuisine_service
    @cuisine_service ||= CuisineService.new
  end
end
