require "spec_helper"

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"

require "rspec/rails"
require "factory_bot_rails"

Rails.root.glob("spec/support/**/*.rb").sort.each { |f| require f }

# rubocop:disable Rails/Exit
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end
# rubocop:enable Rails/Exit

RSpec.configure do |config|
  config.fixture_paths = [Rails.root.join("spec/fixtures")]
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  config.include FactoryBot::Syntax::Methods
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
