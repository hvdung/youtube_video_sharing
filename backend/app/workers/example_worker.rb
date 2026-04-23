class ExampleWorker
  include Sidekiq::Worker
  
  # Set queue name and options
  sidekiq_options queue: 'default', retry: 3

  def perform(name, count = 5)
    # Log job execution
    Rails.logger.info "ExampleWorker: Processing job for #{name}"
    
    # Simulate work
    count.times do |i|
      sleep 1
      Rails.logger.info "ExampleWorker: Step #{i + 1} of #{count} for #{name}"
    end
    
    Rails.logger.info "ExampleWorker: Job completed for #{name}"
  end
end
