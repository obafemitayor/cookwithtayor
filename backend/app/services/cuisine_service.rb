class CuisineService
  def initialize(cuisine_model: Cuisine)
    @cuisine_model = cuisine_model
  end

  def list_all
    cuisine_model.order(:name).pluck(:id, :name).map do |id, name|
      { id: id, name: name }
    end
  end

  private

  attr_reader :cuisine_model
end
