# encoding: utf-8
require 'uri'
require 'sinatra/base'
require 'slim'
require 'json'
require 'sinatra/jsonp'

require "better_errors"



class LiveScheduler < Sinatra::Base
  helpers Sinatra::Jsonp
  
  configure :development do
    use BetterErrors::Middleware
            BetterErrors.application_root =  File.dirname(__FILE__)
    enable :static
    # enable :sessions

    set :views, File.join(File.dirname(__FILE__), 'views')
    set :public_folder, File.join(File.dirname(__FILE__), '')
    set :files, File.join(settings.public_folder, 'files')
    set :unallowed_paths, ['.', '..']
  end
  


  helpers do
    def flash(message = '')
      session[:flash] = message
    end
  end

  before do
    @flash = session.delete(:flash)
  end

  not_found do
    slim 'h1 404'
  end

  error do
    slim "Error (#{request.env['sinatra.error']})"
  end

  get '/' do
    File.read(File.join('demo', 'demo.html'))
  end
  post '/schedule' do
    data ={:result=>[
      {
      :date => "2013-06-2",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one", :status=>"onlive", :classroom=>"class 1", :course=>"course 1"},
        {:time =>"50:00",:title=>"title for this one", :status=>"wait", :classroom=>"class 2", :course=>"course 1"}
    ]},
      {
      :date => "2013-06-8",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one",:status=>"wait",:classroom=>"class 2", :course=>"course 1"},
        {:time =>"50:00",:title=>"title for this one",:status=>"onlive",:classroom=>"class 3",:course=>"course 2"}
    ]},
      {
      :date => "2013-06-4",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one",:status=>"onlive",:classroom=>"class 2",:course=>"course 2"},
        {:time =>"50:00",:title=>"title for this one",:status=>"outday",:classroom=>"class 1",:course=>"course 1"}
    ]}
    ]}
  end
    
  get '/schedule' do
    data ={:result=>[
      {
      :date => "2013-06-2",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one", :status=>"onlive", :classroom=>"class 1", :course=>"course 1"},
        {:time =>"50:00",:title=>"title for this one", :status=>"wait", :classroom=>"class 2", :course=>"course 1"}
    ]},
      {
      :date => "2013-06-8",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one",:status=>"wait",:classroom=>"class 2", :course=>"course 1"},
        {:time =>"50:00",:title=>"title for this one",:status=>"onlive",:classroom=>"class 3",:course=>"course 2"}
    ]},
      {
      :date => "2013-06-4",
      :LiveInfo=>[
        {:time =>"30:00",:title=>"title for this one",:status=>"onlive",:classroom=>"class 2",:course=>"course 2"},
        {:time =>"50:00",:title=>"title for this one",:status=>"outday",:classroom=>"class 1",:course=>"course 1"}
    ]}
    ]}
    
    
    output ={:result=>[]}
    if params[:days] 
      
      selectDays = params[:days].collect { |day|  Date.parse(day).to_s }
      
      # data[:result].each {|re| 
      #         for elem in selectDays
      #            output[:result].push re #if elem == re[:date]
      #         end
      #       }
                    
      data[:result].each {|re| output[:result].push re}
    end
    

    jsonp data
  end


end
