class RoomsController < ApplicationController
  before_action :authenticate_user!, except: [:index]
  def index
    @room = Room.new
    @rooms = Room.all
  end

  def show
    @room = Room.find(params[:id])
    UserRoom.find_or_create_by(user_id: current_user.id, room_id: @room.id)
    @owner = UserRoom.where(room_id: @room.id).first
    @users = UserRoom.where(room_id: @room.id)
  end

  def create
    room = Room.create(room_params)
    room_user = UserRoom.create(user_id: current_user.id, room_id: room.id)
    redirect_to room_path(room.id)
  end

  private

  def room_params
    params.require(:room).permit(:name)
  end
  

end