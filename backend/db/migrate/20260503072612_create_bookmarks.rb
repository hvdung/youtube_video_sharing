class CreateBookmarks < ActiveRecord::Migration[7.1]
  def change
    create_table :bookmarks do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :video_id, null: false
      t.text :noted

      t.timestamps
    end
  end
end
