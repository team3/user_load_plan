class UserPlanActivitiesController < ApplicationController
  unloadable

  def index
    @project = Project.first
    
    @users = UserPlanActivity.all.collect{|activity| User.find(activity.user_id)}

    mindate = UserPlanActivity.where(:project_id => @project.id).collect(&:start_date).min
    maxdate = UserPlanActivity.where(:project_id => @project.id).collect(&:end_date).max

    days_count = (maxdate - mindate) / (60 * 60 * 24)
    plans = []

    @users.each do |u|
      activities = UserPlanActivity.where(:user_id => u.id).collect{|u| [u.start_date.strftime("%s"), u.end_date.strftime("%s"), u.load, u.id]}
      tmp = { "user" => u.id, "activities" => activities }
      plans << tmp
    end

    response = {
      "start" => mindate.strftime("%s"), 
      "end" => maxdate.strftime("%s"), 
      "dayscount" => days_count, 
      "plans" => plans }

    respond_to do |format|
      format.html
      format.json { render json:response }
    end
  end

  def create
    @plan = UserPlanActivity.create(params[:user_plan_activity])

    respond_to do |format|
      if @plan.save
        format.html { redirect_to user_plan_activity_path(@plan), notice: 'Plan was successfully created.' }
        format.json { render json: @plan, status: :created, location: @plan }
      else
        format.html { render action: "new" }
        format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  def new
    @projects = Project.all.collect{|p| [p.name, p.id]}
    @users = User.all.collect{|u| [u.login, u.id]}
    @plan = UserPlanActivity.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @plan }
    end
  end

  def delete
  end

  def edit
  end

  def show
    @activity = UserPlanActivity.find(params[:id])
  end

end
