module Api
  module V1
    class TokenController < ApplicationController

      def refresh
        token_string = params[:refresh_token]
        return render json: { error: "Refresh token is required" }, status: :bad_request if token_string.blank?

        refresh_token = RefreshToken.active.find_by(token: token_string)
        return render json: { error: "Invalid or expired refresh token" }, status: :unauthorized if refresh_token.nil?

        user = refresh_token.user
        refresh_token.destroy

        new_refresh_token = user.refresh_tokens.create!(
          token: SecureRandom.hex(64),
          expires_at: 30.days.from_now
        )

        jwt_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

        response.set_header("Authorization", "Bearer #{jwt_token}")

        render json: {
          message: "Token refreshed successfully",
          refresh_token: new_refresh_token.token,
          user: UserSerializer.new(user).as_json
        }, status: :ok
      end
    end
  end
end
