public/openrailwaymap.app.style.json: tools/generate_openrailwaymap_style.py
	python tools/generate_openrailwaymap_style.py > $@

orm_style: public/openrailwaymap.app.style.json

build: orm_style
	pnpm run build

deploy: build
	./deploy.sh

clean:
	rm -rf dist