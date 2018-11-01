class RoomController < ApplicationController
  before_action :authenticate_user!
  def index
  end

  def show
  end

  def create
  end

  def create_session(room_id=params[:room_id].to_i)
    session[:room_id].push(room_id)
  end
end
