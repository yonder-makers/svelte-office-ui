docker build -t svelte-office-ui-local .

docker run --rm -it -p 80:80 -e API_URL=http://192.168.5.144/ svelte-office-ui-local