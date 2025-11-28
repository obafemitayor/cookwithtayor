class CategoryService
  def initialize(category_model: Category)
    @category_model = category_model
  end

  def list_categories(query: nil, offset: 0, page_size: 20)
    size = page_size.to_i.positive? ? page_size.to_i : 20
    offset_value = [ offset.to_i, 0 ].max
    scope = category_model.all

    if query.present?
      scope = scope.where("LOWER(name) LIKE ?", "%#{query.downcase}%")
    end

    total_count = scope.count
    records = scope.order(:id).offset(offset_value).limit(size).to_a
    has_more = (offset_value + size) < total_count

    {
      categories: records.map { |cat| { id: cat.id, name: cat.name } },
      total: total_count,
      offset: offset_value,
      limit: size,
      has_more: has_more
    }
  end

  private

  attr_reader :category_model
end
