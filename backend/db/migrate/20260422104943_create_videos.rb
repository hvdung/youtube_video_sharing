class CreateVideos < ActiveRecord::Migration[7.1]
  def change
    create_table :videos do |t|
      t.string :url, null: false
      t.string :youtube_id, null: false
      t.string :title, null: false
      t.text :description
      t.string :thumbnail_url
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :videos, [:youtube_id, :user_id], unique: true
  end
end
