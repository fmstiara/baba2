class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  
  has_many :user_rooms, dependent: :destroy
  has_many :rooms, :through => :user_rooms


  def email_required?
  	false
  end
  def email_changed?
  	false
  end

end
