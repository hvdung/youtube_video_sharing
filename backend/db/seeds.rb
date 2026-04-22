# db/seeds.rb
puts "Creating seed users..."

User.find_or_create_by!(email: "admin@example.com") do |user|
  user.name = "Admin User"
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Seed completed!"
