module Api
  module V1
    class BookmarksController < ApplicationController
      before_action :authenticate_user!, only: %i[index create destroy]
      before_action :set_user, only: %i[index create destroy]

      def index
        result = Api::V1::Bookmarks::IndexService.new(user: @user, page: params[:page] || 1).call

        render json: result, status: :ok
      end

      def create
        result = Api::V1::Bookmarks::CreateService.new(current_user, bookmark_params).call

        if result[:duplicate]
          render json: result, status: :conflict
        elsif result[:success]
          render json: result, status: :ok
        else
          render json: result, status: :unprocessable_entity
        end
      end

      def destroy
        result = Api::V1::Bookmarks::DestroyService.new(current_user, params[:id]).call

        status = result[:status] || (result[:success] ? :ok : :unprocessable_entity)
        render json: result, status: status
      end

      private

      def set_user
        @user = User.find(params[:user_id]) if params[:user_id]
      end

      def bookmark_params
        params.require(:bookmark).permit(:video_id, :noted)
      end
    end
  end
end
