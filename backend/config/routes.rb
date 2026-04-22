Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users,
        path: "",
        path_names: {
          sign_in: "login",
          sign_out: "logout",
          registration: "signup"
        },
        controllers: {
          sessions: "api/v1/sessions",
          registrations: "api/v1/registrations"
        }

      post "auth/refresh", to: "token#refresh"

      get "me", to: "users#me"
    end
  end

  get "health", to: proc { [200, {}, ["OK"]] }
end
