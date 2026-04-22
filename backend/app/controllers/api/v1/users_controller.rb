module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      def me
        render json: {
          user: UserSerializer.new(current_user).as_json
        }, status: :ok
      end
    end
  end
end
