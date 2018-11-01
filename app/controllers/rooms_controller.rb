class RoomsController < ApplicationController
  before_action :authenticate_user!
  def index
    @room = Room.new
    @rooms = Room.all
  end

  def show
    @room = Room.find(params[:id])
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