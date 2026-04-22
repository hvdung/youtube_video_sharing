module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      def create
        self.resource = resource_class.find_by(email: resource_params[:email])

        if resource&.valid_password?(resource_params[:password])
          sign_in(resource_name, resource)
          refresh_token = generate_refresh_token(resource)

          render json: {
            message: "Logged in successfully",
            user: UserSerializer.new(resource).as_json,
            refresh_token: refresh_token.token
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      rescue ActionController::ParameterMissing => e
        render json: { error: e.message }, status: :bad_request
      end

      def destroy
        signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))

        if signed_out
          current_user&.refresh_tokens&.delete_all
          render json: { message: "Logged out successfully" }, status: :ok
        else
          render json: { error: "Logout failed" }, status: :unprocessable_entity
        end
      end

      private

      def resource_params
        params.require(:user).permit(:email, :password)
      end

      def generate_refresh_token(user)
        user.refresh_tokens.create!(
          token: SecureRandom.hex(64),
          expires_at: 30.days.from_now
        )
      end

      def respond_with(resource, _opts = {})
        render json: { user: UserSerializer.new(resource).as_json }, status: :ok
      end

      def respond_to_on_destroy
        render json: { message: "Logged out" }, status: :ok
      end
    end
  end
end
