package com.back.project1_team1.product;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProductImageService {

    private final String uploadDir = "uploads/products";

    public String save(MultipartFile image) {

        // 이미지가 없으면 저장하지 않는다.
        if (image == null || image.isEmpty()) {
            return null;
        }

        try {
            // 이미지 저장 폴더가 없으면 생성
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            // 원본 파일명에서 확장자를 추출
            String originalFilename = image.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(
                        originalFilename.lastIndexOf(".")
                );
            }

            // UUID를 이용해 중복되지 않는 파일명을 만든다.
            String filename = UUID.randomUUID() + extension;

            // 최종적으로 저장될 파일 경로
            Path filePath = uploadPath.resolve(filename);

            // 실제 파일 저장
            image.transferTo(filePath);

            // DB에 저장할 이미지 URL 반환
            return "/uploads/products/" + filename;

        } catch (IOException e) {
            throw new IllegalStateException("이미지 저장에 실패했습니다.", e);
        }
    }
}