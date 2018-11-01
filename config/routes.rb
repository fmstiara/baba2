Rails.application.routes.draw do
  get 'rooms/index'
  get 'rooms/show'
  get 'rooms/create'
  root 'room#index'
  resources :rooms, only: [:show, :create]
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
