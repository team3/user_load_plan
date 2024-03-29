class UserPlanActivitiesController < ApplicationController
  unloadable

  def index
    @project = Project.first
    
    @users = UserPlanActivity.all.collect{|activity| User.find(activity.user_id)}.uniq

    mindate = UserPlanActivity.where(:project_id => @project.id).collect(&:start_date).min || DateTime.now - 1
    maxdate = UserPlanActivity.where(:project_id => @project.id).collect(&:end_date).max || DateTime.now + 1

    days_count = (maxdate - mindate).to_i / (60 * 60 * 24)
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
    @plan = UserPlanActivity.find(params[:id])
    @projects = Project.all.collect{|p| [p.name, p.id]}
    @users = User.all.collect{|u| [u.login, u.id]}
  end

  def show
    @activity = UserPlanActivity.find(params[:id])
  end

  # PUT /user_load_plans/1
  # PUT /user_load_plans/1.json
  def update
    @plan = UserPlanActivity.find(params[:id])

    respond_to do |format|
      if @plan.update_attributes(params[:user_plan_activity])
        format.html { redirect_to user_plan_activity_path(@plan), notice: 'Plan was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

end
