class UserPlanActivity < ActiveRecord::Base
  unloadable

  attr_accessor :started_at, :finished_at

  def started_at
    "#{self.start_date.day}-#{self.start_date.month}-#{self.start_date.day} #{self.start_date.hour}:#{self.start_date.minute}"
  end
end
