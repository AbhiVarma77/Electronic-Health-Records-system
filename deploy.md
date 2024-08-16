## Steps for deploying 

1. For building the image, respective dockerfiles would be used. Refer [here](./backend/Dockerfile) for backend & [here](./frontend/Dockerfile) for frontend.
2. For bringing all the containers up and running, use:
    ```
        make up
    ```
    > NOTE: `make up` won't build the docker images, if they already exist. If you want the image to be rebuild, first stop and remove all the containers using the image and then remove the image using `docker rmi <image name/id>`.
3. For stop all the containers, use:
    ```
        make stop
    ```
4. For remove all the containers after stopping, use:
    ```
        make rm
    ```
5. For stop and remove the conatiners, use:
    ```
        make srm
    ```
6. For stop and remove the conatiners, and remove their respective images, use:
    ```
        make rmi
    ```