FactoryBot.define do
  factory :video do
    url           { "https://www.youtube.com/watch?v=#{Faker::Alphanumeric.alphanumeric(number: 11)}" }
    youtube_id    { Faker::Alphanumeric.alphanumeric(number: 11) }
    title         { Faker::Lorem.sentence(word_count: 4) }
    description   { Faker::Lorem.paragraph }
    thumbnail_url { Faker::Internet.url(host: "i.ytimg.com") }
    association :user
  end
end
