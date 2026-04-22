# db/seeds.rb
puts "Creating seed users..."

admin = User.find_or_create_by!(email: "admin@example.com") do |user|
  user.name = "Admin User"
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Creating seed videos..."

# Sample YouTube video IDs and titles
video_data = [
  { youtube_id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up" },
  { youtube_id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE" },
  { youtube_id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee" },
  { youtube_id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You" },
  { youtube_id: "fRh_vgS2dFE", title: "Justin Bieber - Sorry" },
  { youtube_id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth" },
  { youtube_id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars" },
  { youtube_id: "CevxZvSJLk8", title: "Katy Perry - Roar" },
  { youtube_id: "hTWKbfoikeg", title: "Adele - Someone Like You" },
  { youtube_id: "lp-EO5I60KA", title: "LMFAO - Party Rock Anthem ft. Lauren Bennett" }
]

video_data.each do |data|
  Video.find_or_create_by!(youtube_id: data[:youtube_id], user: admin) do |video|
    video.url = "https://www.youtube.com/watch?v=#{data[:youtube_id]}"
    video.title = data[:title]
    video.description = "Sample video description for #{data[:title]}"
    video.thumbnail_url = "https://dummyimage.com/300.png/09f/fff"
  end
end

puts "Created #{Video.count} videos"
puts "Seed completed!"
