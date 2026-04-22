# Backend entrypoint script
set -e

echo "Waiting for database..."
until bundle exec rails db:status 2>/dev/null; do
  echo "DB not ready, waiting..."
  sleep 2
done

echo "Running migrations..."
bundle exec rails db:migrate

echo "Starting Rails server..."
bundle exec rails s -p 3000 -b 0.0.0.0
