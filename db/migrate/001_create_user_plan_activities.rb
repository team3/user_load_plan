class CreateUserPlanActivities < ActiveRecord::Migration
  def change
    create_table :user_plan_activities do |t|
      t.integer :project_id
      t.integer :user_id
      t.datetime :start_date
      t.datetime :end_date
      t.integer :load
    end
  end
end
