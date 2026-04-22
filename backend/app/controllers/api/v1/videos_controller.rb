module Api
  module V1
    class VideosController < ApplicationController
      before_action :authenticate_user!
      before_action :set_user, only: [:index, :create, :destroy]

      def index
        result = Api::V1::Videos::IndexService.new(user: @user).call
        
        render json: result, status: :ok
      end

      def create
        result = Api::V1::Videos::CreateService.new(@user, video_params).call
        
        render json: result, status: :ok
      end

      def destroy
        result = Api::V1::Videos::DestroyService.new(current_user, params[:id]).call
        
        status = result[:status] || (result[:success] ? :ok : :unprocessable_entity)
        render json: result, status: status
      end

      private

      def set_user
        @user = User.find(params[:user_id]) if params[:user_id]
      end
    end
  end
end
