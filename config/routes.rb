Rails.application.routes.draw do
  root "rooms#index"
  resources :rooms, only: [:show, :create]
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }
  devise_scope :user do
    get "/logout" => "users/sessions#destroy", as: "logout"
  end
end
