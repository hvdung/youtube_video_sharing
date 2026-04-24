RSpec.configure do |config|
  # Use IP address as the test host — HostAuthorization always allows IP addresses,
  # so this bypasses the "Blocked hosts" 403 without modifying Rails config.
  config.before(:each, type: :request) do
    host! "127.0.0.1"
  end
end
