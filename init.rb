Redmine::Plugin.register :user_load_plan do
  name 'User Load Plan plugin'
  author 'Andrey Parkhomenko'
  description 'This plugin uses for displaying user load plan'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'

  permission :user_load_plan, { :user_load_plan => [:index, :new] }, :public => true

  menu(:project_menu,
       :user_load_plan,
       {:controller => 'user_plan_activities', :action => 'index'},
       :caption => "TEST",
       :after => :activity,
       :param => :project_id)
end
